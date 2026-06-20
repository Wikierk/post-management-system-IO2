package org.IO2.backend.model;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class UserTest {

    @Test
    void shouldExposeUsernameAndAuthority() {
        User user = User.builder()
                .email("user@example.com")
                .password("secret")
                .role(Role.CLIENT)
                .build();

        assertEquals("user@example.com", user.getUsername());

        Collection<? extends GrantedAuthority> authorities = user.getAuthorities();
        assertEquals(1, authorities.size());
        assertEquals("ROLE_CLIENT", authorities.iterator().next().getAuthority());
    }

    @Test
    void shouldDefaultToUnlockedAccount() {
        User user = User.builder()
                .email("locked@example.com")
                .password("secret")
                .role(Role.CLIENT)
                .build();

        assertFalse(user.isLocked());
        assertTrue(user.isAccountNonExpired());
        assertTrue(user.isAccountNonLocked());
        assertTrue(user.isCredentialsNonExpired());
        assertTrue(user.isEnabled());
    }
}

