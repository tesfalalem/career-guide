<?php

namespace App\Services\AiProviders;

require_once __DIR__ . '/../../Interfaces/AiProviderInterface.php';

use App\Interfaces\AiProviderInterface;

abstract class BaseProvider implements AiProviderInterface {
    protected $apiKey;
    protected $model;

    abstract public function getName();
    abstract public function isAvailable();

    protected function makeRequest($url, $data, $headers) {
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge(['Content-Type: application/json'], $headers));
        
        // Add timeout for reliability
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);

        // Disable SSL verification in development to avoid "SSL certificate problem: unable to get local issuer certificate" on Windows/XAMPP
        if (($_ENV['APP_ENV'] ?? 'production') === 'development') {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($httpCode !== 200) {
            error_log("AI Provider (" . $this->getName() . ") Error (HTTP $httpCode): " . $response . " Curl Error: " . $error);
            return null;
        }

        return json_decode($response, true);
    }

    protected function cleanJson($text) {
        // Remove markdown code blocks
        $text = preg_replace('/```json\s*/', '', $text);
        $text = preg_replace('/```\s*/', '', $text);
        $text = trim($text);
        
        $decoded = json_decode($text, true);
        if ($decoded === null) {
            error_log("AI Provider (" . $this->getName() . "): Failed to parse JSON from response: " . substr($text, 0, 100) . "...");
        }
        return $decoded;
    }
}
