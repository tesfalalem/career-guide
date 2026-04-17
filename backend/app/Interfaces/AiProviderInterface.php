<?php

namespace App\Interfaces;

interface AiProviderInterface {
    /**
     * Generate content based on a prompt.
     * 
     * @param string $prompt
     * @param array $options
     * @return string|array|null
     */
    public function generate($prompt, $options = []);

    /**
     * Get the name of the provider.
     * 
     * @return string
     */
    public function getName();

    /**
     * Check if the provider is available (e.g. key is set).
     * 
     * @return bool
     */
    public function isAvailable();
}
