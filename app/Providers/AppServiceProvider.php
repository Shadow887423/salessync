<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Ensure default string length for older MySQL/MariaDB instances with utf8mb4
        Schema::defaultStringLength(191);

        // Enforce HTTPS URLs in production
        if ($this->app->environment('production')) {
            URL::forceScheme('https');
        }
    }
}
