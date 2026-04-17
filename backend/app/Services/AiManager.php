<?php

namespace App\Services;

require_once __DIR__ . '/AiProviders/GroqProvider.php';
require_once __DIR__ . '/AiProviders/OpenRouterProvider.php';
require_once __DIR__ . '/AiProviders/OllamaProvider.php';

use App\Services\AiProviders\GroqProvider;
use App\Services\AiProviders\OpenRouterProvider;
use App\Services\AiProviders\OllamaProvider;

class AiManager {
    private $providers = [];
    private $order = [];

    public function __construct() {
        // Initialize providers
        $this->providers['groq'] = new GroqProvider();
        $this->providers['openrouter'] = new OpenRouterProvider();
        $this->providers['ollama'] = new OllamaProvider();

        // Load order from environment or use default fallback order
        $orderStr = $_ENV['AI_PROVIDER_ORDER'] ?? 'groq,openrouter,ollama';
        $this->order = array_map('trim', explode(',', $orderStr));
    }

    /**
     * Generate content with automatic fallback logic.
     */
    public function generate($prompt, $options = []) {
        $lastError = null;

        foreach ($this->order as $providerName) {
            if (!isset($this->providers[$providerName])) {
                continue;
            }

            $provider = $this->providers[$providerName];

            if (!$provider->isAvailable()) {
                error_log("AI Manager: Skipping $providerName (not available)");
                continue;
            }

            error_log("AI Manager: Attempting $providerName...");
            $result = $provider->generate($prompt, $options);

            if ($result !== null) {
                error_log("AI Manager: Success with $providerName");
                return $result;
            }

            error_log("AI Manager: $providerName failed, falling back...");
        }

        error_log("AI Manager: All providers failed.");
        return null;
    }

    public function getActiveProviderName() {
        // This is tricky since we don't know until we try.
        // Return the first available provider name.
        foreach ($this->order as $name) {
            if (isset($this->providers[$name]) && $this->providers[$name]->isAvailable()) {
                return $name;
            }
        }
        return 'none';
    }
}
