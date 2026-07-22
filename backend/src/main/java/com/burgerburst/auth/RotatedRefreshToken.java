package com.burgerburst.auth;

import com.burgerburst.entity.User;

public record RotatedRefreshToken(User user, IssuedRefreshToken token) {
}
