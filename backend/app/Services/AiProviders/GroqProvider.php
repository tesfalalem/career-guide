<?php

namespace App\Services\AiProviders;

require_once __DIR__ . '/BaseProvider.php';

class GroqProvider extends BaseProvider {
    private $apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

    public function __construct() {
        $this->apiKey = $_ENV['GROQ_API_KEY'] ?? '';
        $this->model = $_ENV['GROQ_MODEL'] ?? 'llama-3.3-70b-versatile';
    }

    public function getName() {
        return 'groq';
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
            'max_tokens' => $options['max_tokens'] ?? 4096,
            'response_format' => ($options['json'] ?? false) ? ['type' => 'json_object'] : null
        ];

        $response = $this->makeRequest($this->apiUrl, $data, [
            'Authorization: Bearer ' . $this->apiKey
        ]);

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
