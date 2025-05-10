package com.tradingsim.controller;

import com.tradingsim.dto.request.PostRequest;
import com.tradingsim.dto.request.CommentRequest;
import com.tradingsim.model.ForumPost;
import com.tradingsim.model.ForumComment;
import com.tradingsim.model.User;
import com.tradingsim.repository.ForumPostRepository;
import com.tradingsim.repository.ForumCommentRepository;
import com.tradingsim.repository.UserRepository;
import com.tradingsim.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/forum")
public class ForumController {
    
    @Autowired
    private ForumPostRepository forumPostRepository;
    
    @Autowired
    private ForumCommentRepository forumCommentRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping("/posts")
    public ResponseEntity<?> getAllPosts() {
        List<ForumPost> posts = forumPostRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPostById(@PathVariable Long id) {
        Optional<ForumPost> post = forumPostRepository.findById(id);
        
        if (post.isPresent()) {
            return ResponseEntity.ok(post.get());
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Post not found with id: " + id);
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @GetMapping("/posts/{id}/comments")
    public ResponseEntity<?> getPostComments(@PathVariable Long id) {
        Optional<ForumPost> postOpt = forumPostRepository.findById(id);
        
        if (postOpt.isPresent()) {
            List<ForumComment> comments = forumCommentRepository.findByPostOrderByCreatedAtAsc(postOpt.get());
            return ResponseEntity.ok(comments);
        } else {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Post not found with id: " + id);
            return ResponseEntity.status(404).body(response);
        }
    }
    
    @PostMapping("/posts")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createPost(@RequestBody PostRequest postRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found"));
                
        ForumPost post = new ForumPost();
        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setUser(user);
        post.setCreatedAt(LocalDateTime.now());
        post.setCategory(postRequest.getCategory());
        
        ForumPost savedPost = forumPostRepository.save(post);
        
        return ResponseEntity.ok(savedPost);
    }
    
    @PostMapping("/posts/{id}/comments")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody CommentRequest commentRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("Error: User not found"));
                
        ForumPost post = forumPostRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Post not found"));
                
        ForumComment comment = new ForumComment();
        comment.setContent(commentRequest.getContent());
        comment.setUser(user);
        comment.setPost(post);
        comment.setCreatedAt(LocalDateTime.now());
        
        ForumComment savedComment = forumCommentRepository.save(comment);
        
        return ResponseEntity.ok(savedComment);
    }
}
