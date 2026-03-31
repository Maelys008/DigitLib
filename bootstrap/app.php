<?php

use App\Http\Middleware\CheckLibraryAdmin;
use App\Http\Middleware\CheckLibraryStaff;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'check.lib.admin' => CheckLibraryAdmin::class,
            'check.lib.staff' => CheckLibraryStaff::class,

        ]);

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
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
