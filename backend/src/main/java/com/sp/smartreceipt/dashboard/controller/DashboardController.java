package com.sp.smartreceipt.dashboard.controller;

import com.sp.smartreceipt.dashboard.service.DashboardService;
import com.sp.smartreceipt.model.DashboardData;
import com.sp.smartreceipt.model.YearlySpendingSummary;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public DashboardData getDashboardData(@RequestParam Integer year, @RequestParam Integer month) {
        return dashboardService.getDashboardData(year, month);
    }

    @GetMapping("/yearly-spending-summary")
    @ResponseStatus(HttpStatus.OK)
    public YearlySpendingSummary getYearlySpendingSummary(@RequestParam Integer year) {
        return dashboardService.getYearlySpendingSummary(year);
    }
}
