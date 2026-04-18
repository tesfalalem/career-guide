<?php

require_once __DIR__ . '/AiManager.php';

use App\Services\AiManager;

class AiService {
    private $aiManager;

    public function __construct() {
        $this->aiManager = new AiManager();
    }

    /**
     * Maintain compatibility with the old GeminiService generateRoadmap method.
     */
    public function generateRoadmap($role) {
        $prompt = "Create a deep-dive technical learning roadmap for a \"$role\". 
        Return a hierarchical JSON object with this exact structure:
        {
          \"title\": \"Roadmap Title\",
          \"description\": \"Brief overview\",
          \"role\": \"$role\",
          \"phases\": [
            {
              \"id\": \"phase-1\",
              \"title\": \"Phase Name\",
              \"description\": \"What this phase covers\",
              \"duration\": \"4 weeks\",
              \"topics\": [
                {
                  \"title\": \"Main Topic\",
                  \"concepts\": [\"Concept 1\", \"Concept 2\"],
                  \"resources\": [
                     { \"title\": \"Resource Name\", \"url\": \"https://example.com\", \"type\": \"course\" }
                  ]
                }
              ]
            }
          ]
        }
        Requirements:
        1. Detail 4 distinct phases (Beginner to Advanced).
        2. Each phase must have 3-5 main topics.
        3. Include real, high-quality free resources.
        4. Output strictly raw JSON.";

        return $this->aiManager->generate($prompt, ['json' => true]);
    }

    /**
     * Maintain compatibility with the old GeminiService generateCourse method.
     */
    public function generateCourse($role) {
        $prompt = "Create a detailed course structure specifically about \"$role\".
Every module and lesson MUST be directly about \"$role\" — do NOT include generic software topics like Data Structures, Design Patterns, or Algorithms unless they are specifically relevant to \"$role\".

Return ONLY valid JSON with this exact structure:
{
  \"title\": \"Mastering $role\",
  \"description\": \"A complete beginner-to-advanced guide to $role\",
  \"category\": \"$role\",
  \"level\": \"Intermediate\",
  \"duration\": \"40 Hours\",
  \"modules\": [
    {
      \"title\": \"Module 1: [specific $role topic]\",
      \"lessons\": [
        {
          \"title\": \"[specific $role lesson title]\",
          \"content\": \"[CONTENT_PENDING]\",
          \"duration\": \"45 min\"
        }
      ]
    }
  ]
}

Requirements:
- ALL modules and lessons must be specifically about \"$role\"
- Create 5-7 modules covering $role from basics to advanced
- Each module must have 3-5 lessons
- content field must be exactly \"[CONTENT_PENDING]\" for all lessons
- Output ONLY raw JSON";

        return $this->aiManager->generate($prompt, ['json' => true]);
    }

    /**
     * Maintain compatibility with the old GeminiService generateCareerSuggestion method.
     */
    public function generateCareerSuggestion($interests) {
        $prompt = "Suggest a tech career path for a student with these interests: \"$interests\". 
        Provide a specific role, reasoning, top 3 essential skills, and difficulty level as JSON.
        Format:
        {
          \"career\": \"Frontend Developer\",
          \"reason\": \"You like visual design and coding.\",
          \"topSkills\": [\"React\", \"CSS\", \"TypeScript\"],
          \"difficulty\": \"Intermediate\"
        }";

        return $this->aiManager->generate($prompt, ['json' => true]);
    }

    /**
     * Maintain compatibility with the old GeminiService generateLessonContent method.
     */
    public function generateLessonContent($lessonTitle, $moduleTitle, $courseTitle) {
        $prompt = "Write a detailed educational lesson specifically about \"$lessonTitle\" for the course \"$courseTitle\" (module: \"$moduleTitle\").

The content MUST be directly about \"$lessonTitle\" in the context of \"$courseTitle\". Do NOT write about unrelated topics.

Requirements:
1. Output STRICT Markdown only.
2. Start with a 2-3 sentence introduction about this specific topic.
3. Include a \"## Key Concepts\" section with bullet points specific to $lessonTitle.
4. Include practical examples or commands relevant to $courseTitle.
5. End with a \"## Practice Exercise\" section.
6. Length: 400-600 words.
7. Return raw Markdown text only — no JSON, no code fences around the whole response.";

        $content = $this->aiManager->generate($prompt, ['json' => false]);

        if (!$content) {
            return "## $lessonTitle\n\nThis lesson covers **$lessonTitle** as part of the **$moduleTitle** module in the **$courseTitle** course.\n\n## Key Concepts\n\n- Core principles of $lessonTitle\n- Practical applications in $courseTitle\n- Best practices and common patterns\n\n## Practice Exercise\n\nResearch and summarize the main concepts of $lessonTitle and how they apply to $courseTitle.";
        }

        return $content;
    }

    public function generateContent($prompt) {
        return $this->aiManager->generate($prompt, ['json' => true]);
    }

    public function generateAssessment($courseTitle, $courseContent, $questionCount = 5) {
        $prompt = "Create a professional assessment for the course: \"$courseTitle\".
        Course Content Summary: $courseContent
        
        Requirements:
        1. Generate exactly $questionCount multiple-choice questions.
        2. Each question must have 4 options.
        3. Provide the index of the correct answer (0-3).
        4. Include a brief explanation for each correct answer.
        5. Return ONLY valid JSON with this exact structure:
        {
          \"title\": \"Assessment for $courseTitle\",
          \"description\": \"A comprehensive quiz to test your knowledge of $courseTitle.\",
          \"questions\": [
            {
              \"question\": \"Question text?\",
              \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"],
              \"correct_answer\": 0,
              \"explanation\": \"Brief explanation of why Option A is correct.\"
            }
          ]
        }
        
        Output strictly raw JSON.";

        return $this->aiManager->generate($prompt, ['json' => true]);
    }
}
