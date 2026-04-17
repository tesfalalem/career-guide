<?php

require_once __DIR__ . '/../Services/AiService.php';
require_once __DIR__ . '/../Helpers/JWTHelper.php';

class AIController {
    private $aiService;
    private $jwtHelper;

    public function __construct() {
        $this->aiService = new AiService();
        $this->jwtHelper = new JWTHelper();
    }

    public function careerSuggestion() {
        $data = json_decode(file_get_contents("php://input"), true);
        $interests = $data['interests'] ?? '';

        if (empty($interests)) {
            http_response_code(400);
            echo json_encode(['error' => 'Interests are required']);
            return;
        }

        $suggestion = $this->aiService->generateCareerSuggestion($interests);

        if ($suggestion) {
            echo json_encode($suggestion);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to generate career suggestion']);
        }
    }

    public function evaluateQuiz() {
        $data = json_decode(file_get_contents("php://input"), true);
        $answers = $data['answers'] ?? '';

        if (empty($answers)) {
            http_response_code(400);
            echo json_encode(['error' => 'Quiz answers are required']);
            return;
        }

        // For now, return mock data
        // In production, call Gemini API to evaluate
        $recommendations = [
            [
                'career' => 'Fullstack Engineer',
                'reason' => 'Your answers suggest strong interest in both frontend and backend development.',
                'topSkills' => ['React', 'Node.js', 'PostgreSQL'],
                'difficulty' => 'Intermediate'
            ],
            [
                'career' => 'DevOps Engineer',
                'reason' => 'Your preference for automation and infrastructure indicates DevOps alignment.',
                'topSkills' => ['Docker', 'Kubernetes', 'AWS'],
                'difficulty' => 'Advanced'
            ],
            [
                'career' => 'AI Engineer',
                'reason' => 'Your interest in data and algorithms aligns with AI/ML career paths.',
                'topSkills' => ['Python', 'TensorFlow', 'Statistics'],
                'difficulty' => 'Advanced'
            ]
        ];

        echo json_encode($recommendations);
    }

    public function generateLessonContent() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $lessonTitle = $data['lesson_title'] ?? '';
        $moduleTitle = $data['module_title'] ?? '';
        $courseTitle = $data['course_title'] ?? '';

        if (empty($lessonTitle) || empty($moduleTitle) || empty($courseTitle)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            return;
        }

        $content = $this->aiService->generateLessonContent($lessonTitle, $moduleTitle, $courseTitle);

        if ($content) {
            echo json_encode(['content' => $content]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to generate lesson content']);
        }
    }

    public function generateCareerDetails() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        if (!isset($data['career'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Career field is required']);
            return;
        }

        $career = $data['career'];
        $interest = $data['interest'] ?? '';

        $prompt = "Generate comprehensive career details for: {$career}
        
        Provide a detailed JSON response with:
        1. overview: A comprehensive 2-3 paragraph overview of the career
        2. market_insights: Current job market trends and demand
        3. salary_range: Expected salary range (entry, mid, senior levels)
        4. required_skills: Array of 8-10 essential skills with descriptions
        5. learning_path: Structured learning path with phases
        6. job_opportunities: Types of companies and roles available
        7. growth_potential: Career advancement opportunities
        8. daily_responsibilities: What a typical day looks like
        
        Format as valid JSON.";

        try {
            $response = $this->aiService->generateContent($prompt);
            
            if ($response) {
                echo json_encode([
                    'success' => true,
                    'career' => $career,
                    'details' => $response
                ]);
            } else {
                // Fallback to mock data
                $mockDetails = $this->generateMockCareerDetails($career);
                echo json_encode([
                    'success' => true,
                    'career' => $career,
                    'details' => $mockDetails,
                    'mock' => true
                ]);
            }
        } catch (Exception $e) {
            // Fallback to mock data on error
            $mockDetails = $this->generateMockCareerDetails($career);
            echo json_encode([
                'success' => true,
                'career' => $career,
                'details' => $mockDetails,
                'mock' => true
            ]);
        }
    }

    private function generateMockCareerDetails($career) {
        return [
            'overview' => "A {$career} professional is responsible for designing, developing, and maintaining systems and applications in their field. This role requires a combination of technical expertise, problem-solving skills, and continuous learning to stay current with industry trends. Professionals in this field work on challenging projects that impact users and businesses globally.\n\nThe career path offers excellent growth opportunities, with demand consistently high across various industries. As technology evolves, {$career} professionals are at the forefront of innovation, creating solutions that shape the future of digital experiences.",
            
            'market_insights' => "The job market for {$career} professionals remains robust with consistent growth projected over the next decade. Companies across all sectors are actively seeking skilled professionals, with particularly high demand in tech hubs and emerging markets. Remote work opportunities have expanded the talent pool globally, offering flexibility and competitive compensation.",
            
            'salary_range' => [
                'entry' => '$45,000 - $70,000',
                'mid' => '$70,000 - $110,000',
                'senior' => '$110,000 - $180,000+',
                'lead' => '$150,000 - $250,000+'
            ],
            
            'required_skills' => [
                ['name' => 'Core Technical Skills', 'description' => 'Proficiency in relevant programming languages, frameworks, and tools'],
                ['name' => 'Problem Solving', 'description' => 'Ability to analyze complex problems and develop efficient solutions'],
                ['name' => 'System Design', 'description' => 'Understanding of architecture patterns and scalable system design'],
                ['name' => 'Version Control', 'description' => 'Git and collaborative development workflows'],
                ['name' => 'Testing & Debugging', 'description' => 'Writing tests and debugging complex issues'],
                ['name' => 'Communication', 'description' => 'Clear technical communication with team members and stakeholders'],
                ['name' => 'Continuous Learning', 'description' => 'Staying updated with new technologies and best practices'],
                ['name' => 'Project Management', 'description' => 'Understanding of agile methodologies and project workflows']
            ],
            
            'learning_path' => [
                ['phase' => 'Foundation', 'duration' => '3-6 months', 'focus' => 'Core concepts, basic programming, and fundamental tools'],
                ['phase' => 'Intermediate', 'duration' => '6-12 months', 'focus' => 'Advanced concepts, frameworks, and real-world projects'],
                ['phase' => 'Advanced', 'duration' => '12-18 months', 'focus' => 'System design, optimization, and specialized skills'],
                ['phase' => 'Expert', 'duration' => 'Ongoing', 'focus' => 'Leadership, architecture, and cutting-edge technologies']
            ],
            
            'job_opportunities' => [
                'Tech Companies' => 'Startups to Fortune 500 companies building innovative products',
                'Consulting Firms' => 'Working with diverse clients on varied projects',
                'Financial Services' => 'Banks, fintech, and trading platforms',
                'Healthcare' => 'Medical software and health tech companies',
                'E-commerce' => 'Online retail and marketplace platforms',
                'Freelance/Contract' => 'Independent consulting and project-based work'
            ],
            
            'growth_potential' => "Career progression typically follows: Junior → Mid-level → Senior → Lead → Principal/Architect → Director/VP of Engineering. Many professionals also transition into product management, technical leadership, or entrepreneurship. The skills are highly transferable across industries and geographies.",
            
            'daily_responsibilities' => [
                'Writing and reviewing code',
                'Collaborating with team members on design and implementation',
                'Participating in planning and sprint meetings',
                'Debugging and resolving technical issues',
                'Learning new technologies and tools',
                'Mentoring junior team members',
                'Contributing to technical documentation',
                'Staying updated with industry trends'
            ]
        ];
    }
}
