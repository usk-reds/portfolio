package com.example.todo_backend.domain;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor

public class Task {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String title;

	private boolean done;

	private String detail;

	@JsonFormat(pattern = "yyyy-MM-dd")
	@Column(name = "due_date")
	private LocalDate dueDate;

	@JsonFormat(pattern = "yyyy-MM-dd")
	@Column(name = "created_at", updatable = false)
	private LocalDate createdAt;

	private String category;

	@JsonIgnore
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	private AppUser user;
}
