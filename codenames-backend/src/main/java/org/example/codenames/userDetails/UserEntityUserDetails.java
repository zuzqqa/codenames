package org.example.codenames.userDetails;

import lombok.Getter;
import lombok.Setter;

import org.example.codenames.user.entity.User;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * UserEntityUserDetails class is used to get the user details
 */
@Getter
@Setter
public class UserEntityUserDetails implements UserDetails {
    /**
     * Username of the user
     */
    private String username;

    /**
     * Password of the user
     */
    private String password;

    /**
     * Authority of the user
     */
    private List<GrantedAuthority> authority;

    /**
     * Constructor of UserEntityUserDetails class
     * @param user User object
     */
    public UserEntityUserDetails(User user) {
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.authority = Arrays.stream(user.getRoles().split(","))
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
    }

    /**
     * Get the authorities of the user
     * @return Collection of authorities
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authority;
    }

    /**
     * Get information about the user's account expiration
     * @return True if the account is non expired, false otherwise
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Get information about the user's account lock
     * @return True if the account is non locked, false otherwise
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Get information about the user's credentials expiration
     * @return True if the credentials are non expired, false otherwise
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Get information about the user's account enablement
     * @return True if the account is enabled, false otherwise
     */
    @Override
    public boolean isEnabled() {
        return true;
    }
}
