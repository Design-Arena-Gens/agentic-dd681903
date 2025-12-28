import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// LinkedIn OAuth endpoints
const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

async function generateAIContent(geminiApiKey: string) {
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Generate post content
  const prompt = `Generate an engaging LinkedIn post about an interesting AI topic.
  The post should be:
  - Professional and insightful
  - 150-250 words
  - Include relevant hashtags (3-5)
  - Focus on recent AI trends, applications, or insights
  - Encourage engagement

  Just provide the post text, nothing else.`;

  const result = await model.generateContent(prompt);
  const postText = result.response.text();

  // Generate image prompt
  const imagePromptResult = await model.generateContent(
    `Based on this LinkedIn post about AI, create a detailed image generation prompt (1-2 sentences) for an eye-catching, professional image:

    ${postText}

    Just provide the image prompt, nothing else.`
  );
  const imagePrompt = imagePromptResult.response.text();

  // Generate image using Imagen
  const imageModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Note: For actual image generation, we'll use a placeholder approach
  // In production, you'd use Google's Imagen API or another image generation service

  return {
    postText,
    imagePrompt,
  };
}

async function uploadImageToLinkedIn(accessToken: string, personUrn: string, imageUrl: string) {
  // Register upload
  const registerResponse = await axios.post(
    `${LINKEDIN_API_BASE}/assets?action=registerUpload`,
    {
      registerUploadRequest: {
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        owner: personUrn,
        serviceRelationships: [
          {
            relationshipType: 'OWNER',
            identifier: 'urn:li:userGeneratedContent',
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const uploadUrl = registerResponse.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const asset = registerResponse.data.value.asset;

  // Download image
  const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(imageResponse.data);

  // Upload image
  await axios.put(uploadUrl, imageBuffer, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'image/png',
    },
  });

  return asset;
}

async function postToLinkedIn(accessToken: string, personUrn: string, text: string, imageAsset?: string) {
  const postData: any = {
    author: personUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text,
        },
        shareMediaCategory: imageAsset ? 'IMAGE' : 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  if (imageAsset) {
    postData.specificContent['com.linkedin.ugc.ShareContent'].media = [
      {
        status: 'READY',
        description: {
          text: 'AI Generated Image',
        },
        media: imageAsset,
        title: {
          text: 'AI Insights',
        },
      },
    ];
  }

  const response = await axios.post(`${LINKEDIN_API_BASE}/ugcPosts`, postData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  return response.data;
}

async function generatePlaceholderImage(imagePrompt: string): Promise<string> {
  // Use a simple placeholder image service with text overlay
  // In production, integrate with Imagen API, DALL-E, or Stable Diffusion
  const encodedText = encodeURIComponent(imagePrompt.substring(0, 50));
  return `https://placehold.co/1200x630/4A90E2/FFFFFF/png?text=${encodedText}`;
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const linkedinAccessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const linkedinPersonUrn = process.env.LINKEDIN_PERSON_URN;

    if (!geminiApiKey || !linkedinAccessToken || !linkedinPersonUrn) {
      return NextResponse.json(
        {
          error: 'Missing required environment variables',
          required: ['GEMINI_API_KEY', 'LINKEDIN_ACCESS_TOKEN', 'LINKEDIN_PERSON_URN']
        },
        { status: 500 }
      );
    }

    // Generate AI content
    const { postText, imagePrompt } = await generateAIContent(geminiApiKey);

    // Generate placeholder image (replace with actual image generation in production)
    const imageUrl = await generatePlaceholderImage(imagePrompt);

    // Upload image to LinkedIn
    let imageAsset;
    try {
      imageAsset = await uploadImageToLinkedIn(linkedinAccessToken, linkedinPersonUrn, imageUrl);
    } catch (error) {
      console.error('Image upload failed, posting without image:', error);
    }

    // Post to LinkedIn
    const postResult = await postToLinkedIn(linkedinAccessToken, linkedinPersonUrn, postText, imageAsset);

    return NextResponse.json({
      success: true,
      postText,
      imagePrompt,
      imageUrl,
      postId: postResult.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      {
        error: 'Failed to create LinkedIn post',
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
