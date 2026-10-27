<?php

use Illuminate\Support\Str;

return [

    /*
    |--------------------------------------------------------------------------
    | Default Session Driver
    |--------------------------------------------------------------------------
    */

    'driver' => env('SESSION_DRIVER', 'file'),

    'lifetime' => env('SESSION_LIFETIME', 120),

    'expire_on_close' => false,

    'encrypt' => false,

    'files' => storage_path('framework/sessions'),

    'connection' => env('SESSION_CONNECTION'),

    'table' => 'sessions',

    'store' => env('SESSION_STORE'),

    'lottery' => [2, 100],

    'cookie' => env(
        'SESSION_COOKIE',
        Str::slug(env('APP_NAME', 'laravel'), '_').'_session'
    ),

    'path' => '/',

    'domain' => env('SESSION_DOMAIN'),

    /*
    | Security Hardening:
    | - secure: Enforce HTTPS transmission of cookies in production.
    | - http_only: Prevent client-side JavaScript from accessing cookies (blocks XSS session theft).
    | - same_site: Set to 'lax' to prevent CSRF attacks from external links.
    */
    'secure' => env('SESSION_SECURE_COOKIE', env('APP_ENV') === 'production'),

    'http_only' => true,

    'same_site' => 'lax',

];
