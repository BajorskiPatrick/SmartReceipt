package com.sp.smartreceipt.category.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum PredefinedCategories {
    GROCERIES("Groceries"),

    ALCOHOL_AND_STIMULANTS("Alcohol and stimulants"),

    HOUSEHOLD_AND_CHEMISTRY("Household and chemistry"),

    COSMETICS("Cosmetics"),

    ENTERTAINMENT("Entertainment"),

    TAXES_AND_FEES("Taxes and fees"),

    TRANSPORT("Transport"),

    OTHER("Other");

    private final String displayName;
}
