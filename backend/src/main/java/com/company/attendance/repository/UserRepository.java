package com.company.attendance.repository;

import com.company.attendance.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Login accepts either the employee code or the email address, so both are
     * matched in one query rather than two round trips.
     */
    @EntityGraph(attributePaths = {"roles", "roles.permissions", "employee"})
    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:identifier) OR LOWER(u.email) = LOWER(:identifier)")
    Optional<User> findByUsernameOrEmail(@Param("identifier") String identifier);

    @EntityGraph(attributePaths = {"roles", "roles.permissions", "employee"})
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findWithRolesById(@Param("id") Long id);

    /** The login behind an employee record, if one has been provisioned. */
    @Query("SELECT u FROM User u WHERE u.employee.id = :employeeId")
    Optional<User> findByEmployeeId(@Param("employeeId") Long employeeId);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    boolean existsByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);
}
