<?php

namespace App\Services\AiProviders;

require_once __DIR__ . '/BaseProvider.php';

class OllamaProvider extends BaseProvider {
    private $apiUrl;

    public function __construct() {
        $host = $_ENV['OLLAMA_HOST'] ?? 'http://localhost:11434';
        $this->apiUrl = rtrim($host, '/') . '/api/chat';
        $this->model = $_ENV['OLLAMA_MODEL'] ?? 'llama3';
    }

    public function getName() {
        return 'ollama';
    }

    public function isAvailable() {
        // We can't easily check if Ollama is running without a request, 
        // but we'll assume it's available if the host is set.
        return true;
    }

    public function generate($prompt, $options = []) {
        $data = [
            'model' => $this->model,
            'messages' => [
                ['role' => 'user', 'content' => $prompt]
            ],
            'stream' => false,
            'options' => [
                'temperature' => $options['temperature'] ?? 0.7
            ]
        ];

        if ($options['json'] ?? false) {
            $data['format'] = 'json';
        }

        $response = $this->makeRequest($this->apiUrl, $data, []);

        if (!$response) {
            return null;
        }

        $text = $response['message']['content'] ?? null;

        if (!$text) {
            return null;
        }

        if ($options['json'] ?? false) {
            return $this->cleanJson($text);
        }

        return $text;
    }
}
