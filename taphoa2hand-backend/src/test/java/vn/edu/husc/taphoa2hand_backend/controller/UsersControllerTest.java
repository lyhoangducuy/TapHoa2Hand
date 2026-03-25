package vn.edu.husc.taphoa2hand_backend.controller;


import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.fasterxml.jackson.databind.ObjectMapper;

import vn.edu.husc.taphoa2hand_backend.dto.request.UsersDTO.UserCreateRequest;
import vn.edu.husc.taphoa2hand_backend.dto.response.UserResponse;
import vn.edu.husc.taphoa2hand_backend.service.UsersService;

@SpringBootTest
public class UsersControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private UsersService usersService;
    private LocalDate dob;

    private UserCreateRequest userCreateRequest;
    private UserResponse userResponse;

    @BeforeEach
    void initData(){
        dob = LocalDate.of(1990, 1, 1);
        List<String> a = List.of("ROLE_USER");
        userCreateRequest = UserCreateRequest.builder()
                .username("testuser")
                .email("testuser@example.com")
                .password("password123")
                .dob(dob)
                .roles(a)
                .build();
        userResponse = UserResponse.builder()
                .id("123e4567-e89b-12d3-a456-426614174000")
                .username("testuser")
                .email("testuser@example.com")
                .dob(dob)
                .build();
    }
    @Test
    void createUser_success() throws Exception{
        //GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content= objectMapper.writeValueAsString(userCreateRequest);

        Mockito.when(usersService.createUser(ArgumentMatchers.any())).thenReturn(userResponse);
        //WHEN,Then
        mockMvc.perform(MockMvcRequestBuilders.post("/user/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(content))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));
        //THEN
    }
}
