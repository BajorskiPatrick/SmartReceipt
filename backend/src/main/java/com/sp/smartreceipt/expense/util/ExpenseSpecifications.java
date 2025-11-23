package com.sp.smartreceipt.expense.util;

import com.sp.smartreceipt.expense.entity.ExpenseEntity;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

public class ExpenseSpecifications {

    public static Specification<ExpenseEntity> hasUser(String userEmail) {
        return (root, query, cb) -> cb.equal(root.get("user").get("email"), userEmail);
    }

    public static Specification<ExpenseEntity> inMonth(Integer year, Integer month) {
        return (root, query, cb) -> {
            if (year == null || month == null) {
                return null;
            }

            LocalDate startOfMonth = LocalDate.of(year, month, 1);

            LocalDate startOfNextMonth = startOfMonth.plusMonths(1);

            OffsetDateTime start = startOfMonth.atStartOfDay().atOffset(ZoneOffset.UTC);
            OffsetDateTime end = startOfNextMonth.atStartOfDay().atOffset(ZoneOffset.UTC);

            return cb.and(
                    cb.greaterThanOrEqualTo(root.get("transactionDate"), start),
                    cb.lessThan(root.get("transactionDate"), end)
            );
        };
    }
}
