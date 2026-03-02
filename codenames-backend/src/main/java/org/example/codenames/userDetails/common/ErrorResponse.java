package org.example.codenames.userDetails.common;

import lombok.Getter;

@Getter
public class ErrorResponse {

    public String error;

    public ErrorResponse(String error) {
        this.error = error;
    }
}
