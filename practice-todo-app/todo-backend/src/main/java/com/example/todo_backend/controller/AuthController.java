package com.example.todo_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import com.example.todo_backend.domain.AppUser;
import com.example.todo_backend.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@PostMapping("/register")
	public ResponseEntity<?> register(@RequestBody RegisterRequest request){
		if(userRepository.findByUsername(request.username()).isPresent()){
			return ResponseEntity.badRequest().body("このユーザー名はすでに使われています。");
		}

		var user = new AppUser();
		user.setUsername(request.username());
		user.setPassword(passwordEncoder.encode(request.password()));
		user.setRole("USER");
		userRepository.save(user);

		return ResponseEntity.ok("登録完了");
	}

	@GetMapping("/me")
	public ResponseEntity<?> me(@AuthenticationPrincipal UserDetails userDetails) {
		if (userDetails == null) return ResponseEntity.status(401).build();
		return ResponseEntity.ok(Map.of("username", userDetails.getUsername()));
	}

	public record RegisterRequest(String username, String password) {}
}
