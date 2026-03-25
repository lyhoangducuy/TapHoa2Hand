package vn.edu.husc.taphoa2hand_backend.services;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
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
import vn.edu.husc.taphoa2hand_backend.repository.UsersRepository;
import vn.edu.husc.taphoa2hand_backend.service.UsersService;

@SpringBootTest
public class UsersServicesTest {
    @Autowired
    private UsersService usersService;
    @Autowired
    private MockMvc mockMvc;

    private UserCreateRequest userCreateRequest;
    private UserResponse userResponse;
    private LocalDate dob;

    @MockBean
    private UsersRepository usersRepository;

    @BeforeEach
    void initData(){
        dob= LocalDate.of(1990, 1, 1);
        userCreateRequest=UserCreateRequest.builder()
                .username("testuser")
                .email("duucy1711@gmail.com")
                .password("password123")
                .dob(dob)
                .build();
        userResponse=UserResponse.builder()
                .id("123e4567-e89b-12d3-a456-426614174000")
                .username("testuser")
                .email("duucy1711@gmail.com")
                .dob(dob)
                .build();
    }
    void createUser_success() throws Exception{
        //GIVEN
        ObjectMapper objectMapper = new ObjectMapper();
        String content= objectMapper.writeValueAsString(userCreateRequest);
        Mockito.when(usersService.createUser(ArgumentMatchers.any()))
                .thenReturn(userResponse);
        //WHEN
        mockMvc.perform(MockMvcRequestBuilders.post("/auth/create")
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .content(content))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000));


    }
    
}
