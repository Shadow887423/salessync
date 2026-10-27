<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Handle an incoming request and attach hardened security headers.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prevent MIME type sniffing attacks
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Prevent Clickjacking by disallowing framing from external origins
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Legacy browser XSS filter enforcement
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Restrict referrer leakage to external domains
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Disable unused sensitive browser APIs
        $response->headers->set(
            'Permissions-Policy',
            'accelerometer=(), autoplay=(), camera=(), encrypted-media=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), usb=()'
        );

        // Content Security Policy (CSP): Defense in depth against XSS and data exfiltration
        $csp = "default-src 'self'; "
            . "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; "
            . "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; "
            . "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; "
            . "img-src 'self' data: https:; "
            . "connect-src 'self'; "
            . "frame-ancestors 'self'; "
            . "form-action 'self'; "
            . "base-uri 'self';";

        $response->headers->set('Content-Security-Policy', $csp);

        // Enforce HTTPS Strict Transport Security (HSTS) when request is secure or in production
        if ($request->isSecure() || app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        return $response;
    }
}
