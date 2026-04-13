package com.example.todo_backend;

import com.example.todo_backend.domain.AppUser;
import com.example.todo_backend.domain.Task;
import com.example.todo_backend.repository.TaskRepository;
import com.example.todo_backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private TaskRepository taskRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    record Seed(String title, String detail, String createdAt, String dueDate, String category, boolean done) {}

    @Override
    @Transactional
    public void run(String... args) {
        if (taskRepository.count() > 0) return;

        // 既存ユーザーがなければデフォルトユーザーを作成
        AppUser user;
        var users = userRepository.findAll();
        if (users.isEmpty()) {
            var u = new AppUser();
            u.setUsername("focus");
            u.setPassword(passwordEncoder.encode("focus"));
            u.setRole("USER");
            user = userRepository.save(u);
        } else {
            user = users.get(0);
        }

        var seeds = List.of(
            new Seed("テストタスク1",  "テスト詳細1",  "2026-04-07", "2026-04-08", "書類作成",      true),
            new Seed("テストタスク2",  "テスト詳細2",  "2026-04-07", "2026-04-09", "開発（PJ）",    true),
            new Seed("テストタスク3",  "テスト詳細3",  "2026-04-07", "2026-04-10", "テスト（PJ）",  true),
            new Seed("テストタスク4",  "テスト詳細4",  "2026-04-07", "2026-04-11", "開発（社内）",  true),
            new Seed("テストタスク5",  "テスト詳細5",  "2026-04-07", "2026-04-12", "テスト（社内）",true),
            new Seed("テストタスク6",  "テスト詳細6",  "2026-04-07", "2026-04-13", "調査/分析/学習",true),
            new Seed("テストタスク7",  "テスト詳細7",  "2026-04-07", "2026-04-14", "その他",        true),
            new Seed("テストタスク8",  "テスト詳細8",  "2026-04-07", "2026-04-15", "開発（PJ）",    true),
            new Seed("テストタスク9",  "テスト詳細9",  "2026-04-07", "2026-04-16", "テスト（PJ）",  true),
            new Seed("テストタスク10", "テスト詳細10", "2026-04-07", "2026-04-17", "開発（社内）",  true),
            new Seed("テストタスク11", "テスト詳細11", "2026-04-07", "2026-04-18", "テスト（社内）",true),
            new Seed("テストタスク12", "テスト詳細12", "2026-04-07", "2026-04-19", "調査/分析/学習",true),
            new Seed("テストタスク13", "テスト詳細13", "2026-04-07", "2026-04-20", "その他",        true),
            new Seed("テストタスク14", "テスト詳細14", "2026-04-07", "2026-04-21", "開発（PJ）",    true),
            new Seed("テストタスク15", "テスト詳細15", "2026-04-07", "2026-04-22", "テスト（PJ）",  true),
            new Seed("テストタスク16", "テスト詳細16", "2026-04-07", "2026-04-23", "開発（社内）",  true),
            new Seed("テストタスク17", "テスト詳細17", "2026-04-07", "2026-04-24", "テスト（社内）",false),
            new Seed("テストタスク18", "テスト詳細18", "2026-04-07", "2026-04-25", "開発（PJ）",    false),
            new Seed("テストタスク19", "テスト詳細19", "2026-04-07", "2026-04-26", "開発（社内）",  false),
            new Seed("テストタスク20", "テスト詳細20", "2026-04-07", "2026-04-27", "開発（PJ）",    true),
            new Seed("テストタスク21", "テスト詳細21", "2026-04-07", "2026-04-28", "開発（社内）",  true),
            new Seed("テストタスク22", "テスト詳細22", "2026-04-07", "2026-04-29", "その他",        true),
            new Seed("テストタスク23", "テスト詳細23", "2026-04-07", "2026-04-30", null,            false)
        );

        for (var s : seeds) {
            var task = new Task();
            task.setTitle(s.title());
            task.setDetail(s.detail());
            task.setCreatedAt(LocalDate.parse(s.createdAt()));
            task.setDueDate(LocalDate.parse(s.dueDate()));
            task.setCategory(s.category());
            task.setDone(s.done());
            task.setUser(user);
            taskRepository.save(task);
        }
    }
}
