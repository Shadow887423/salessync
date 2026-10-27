@extends('layouts.app')

@section('content')
<div class="error-page">
    <div class="error-page__content">
        <div class="error-page__icon">
            <i class="fas fa-exclamation-circle"></i>
        </div>
        <h1 class="error-page__code">404</h1>
        <h2 class="error-page__title">Page Not Found</h2>
        <p class="error-page__message">The page you're looking for doesn't exist or has been moved.</p>
        <a href="/" class="btn btn-primary">
            <i class="fas fa-home"></i> Go to Dashboard
        </a>
    </div>
</div>
@endsection
