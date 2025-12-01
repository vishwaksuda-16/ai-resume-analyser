export const resumes: Resume[] = [
    {
        id: "1",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "../images/resume_01.png",
        resumePath: "../resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "2",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "./images/resume_02.png",
        resumePath: "./resumes/resume-2.pdf",
        feedback: {
            overallScore: 55,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "3",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "./images/resume_03.png",
        resumePath: "./resumes/resume-3.pdf",
        feedback: {
            overallScore: 75,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    },
    {
        id: "4",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "../images/resume_01.png",
        resumePath: "../resumes/resume-1.pdf",
        feedback: {
            overallScore: 85,
            ATS: {
                score: 90,
                tips: [],
            },
            toneAndStyle: {
                score: 90,
                tips: [],
            },
            content: {
                score: 90,
                tips: [],
            },
            structure: {
                score: 90,
                tips: [],
            },
            skills: {
                score: 90,
                tips: [],
            },
        },
    }
];

export const AIResponseFormat = `
{
  "overallScore": number, // Overall score from 0-100
  "ATS": {
    "score": number, // ATS suitability score from 0-100
    "tips": [
      {
        "type": "good" | "improve",
        "tip": string // 3-4 concise ATS optimization tips
      }
    ]
  },
  "toneAndStyle": {
    "score": number, // Tone and style score from 0-100
    "tips": [
      {
        "type": "good" | "improve",
        "tip": string, // Short title
        "explanation": string // Detailed explanation
      }
    ] // 3-4 tips
  },
  "content": {
    "score": number, // Content quality score from 0-100
    "tips": [
      {
        "type": "good" | "improve",
        "tip": string, // Short title
        "explanation": string // Detailed explanation
      }
    ] // 3-4 tips
  },
  "structure": {
    "score": number, // Structure score from 0-100
    "tips": [
      {
        "type": "good" | "improve",
        "tip": string, // Short title
        "explanation": string // Detailed explanation
      }
    ] // 3-4 tips
  },
  "skills": {
    "score": number, // Skills relevance score from 0-100
    "tips": [
      {
        "type": "good" | "improve",
        "tip": string, // Short title
        "explanation": string // Detailed explanation
      }
    ] // 3-4 tips
  }
}`;

export const prepareInstructions = ({
                                        jobTitle,
                                        jobDescription,
                                        AIResponseFormat,
                                    }: {
    jobTitle: string;
    jobDescription: string;
    AIResponseFormat: string;
}) =>
    `You are an expert in ATS (Applicant Tracking System) and resume analysis.

CRITICAL INSTRUCTIONS:
1. Analyze the resume thoroughly and provide honest, detailed feedback
2. Rate each category from 0-100 (don't hesitate to give low scores if warranted)
3. Compare the resume against the job requirements below
4. Provide 3-4 actionable tips for each category
5. Your response MUST be ONLY a valid JSON object matching the exact format below
6. DO NOT include any markdown formatting, code blocks, or explanatory text
7. DO NOT wrap the JSON in backticks or code fences
8. Return ONLY the raw JSON object

Job Information:
- Job Title: ${jobTitle}
- Job Description: ${jobDescription}

Required JSON Response Format:
${AIResponseFormat}

EXAMPLE of correct response structure:
{
  "overallScore": 75,
  "ATS": {
    "score": 80,
    "tips": [
      {"type": "good", "tip": "Resume includes key technical keywords"},
      {"type": "improve", "tip": "Add more quantifiable achievements"}
    ]
  },
  "toneAndStyle": {
    "score": 70,
    "tips": [
      {"type": "good", "tip": "Professional tone", "explanation": "The resume maintains a professional and confident tone throughout"},
      {"type": "improve", "tip": "Action verbs", "explanation": "Use stronger action verbs like 'spearheaded' instead of 'worked on'"}
    ]
  },
  "content": {
    "score": 65,
    "tips": [
      {"type": "improve", "tip": "Add metrics", "explanation": "Include quantifiable results like 'improved performance by 30%'"}
    ]
  },
  "structure": {
    "score": 85,
    "tips": [
      {"type": "good", "tip": "Clear sections", "explanation": "Resume has well-organized sections"}
    ]
  },
  "skills": {
    "score": 70,
    "tips": [
      {"type": "improve", "tip": "Add missing skills", "explanation": "Include ${jobTitle}-specific skills mentioned in job description"}
    ]
  }
}

Now analyze the resume and return ONLY the JSON object, nothing else.`;