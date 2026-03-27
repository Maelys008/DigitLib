<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Console\Scheduling\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'check.lib.admin' => \App\Http\Middleware\CheckLibraryAdmin::class,
            'check.lib.staff' => \App\Http\Middleware\CheckLibraryStaff::class,

        ]);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('loans:send-reminders')->dailyAt('08:00');
        $schedule->command('loans:update-penalties')->dailyAt('01:00');
        $schedule->command('reservations:cancel-expired')->hourly();
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
