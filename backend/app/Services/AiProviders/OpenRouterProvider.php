<?php

namespace App\Services\AiProviders;

require_once __DIR__ . '/BaseProvider.php';

class OpenRouterProvider extends BaseProvider {
    private $apiUrl = 'https://openrouter.ai/api/v1/chat/completions';

    public function __construct() {
        $this->apiKey = $_ENV['OPENROUTER_API_KEY'] ?? '';
        $this->model = $_ENV['OPENROUTER_MODEL'] ?? 'google/gemini-2.0-flash-001'; // Default to a reliable free model if not specified
    }

    public function getName() {
        return 'openrouter';
    }

    public function isAvailable() {
        return !empty($this->apiKey);
    }

    public function generate($prompt, $options = []) {
        if (!$this->isAvailable()) {
            return null;
        }

        $data = [
            'model' => $this->model,
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
            'temperature' => $options['temperature'] ?? 0.7,
            'max_tokens' => $options['max_tokens'] ?? 4096
        ];

        // OpenRouter requires specific headers
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'HTTP-Referer: http://localhost:8000', // Update with your actual URL in production
            'X-Title: CareerGuide'
        ];

        $response = $this->makeRequest($this->apiUrl, $data, $headers);

        if (!$response) {
            return null;
        }

        $text = $response['choices'][0]['message']['content'] ?? null;

        if (!$text) {
            return null;
        }

        if ($options['json'] ?? false) {
            return $this->cleanJson($text);
        }

        return $text;
    }
}
