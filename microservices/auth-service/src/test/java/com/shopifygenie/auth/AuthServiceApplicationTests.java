package com.shopifygenie.auth;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.kafka.KafkaAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.kafka.core.KafkaTemplate;

import com.shopifygenie.auth.repository.UserRepository;
import com.shopifygenie.shared.event.NotificationEvent;

@EnableAutoConfiguration(exclude = {
    DataSourceAutoConfiguration.class,
    HibernateJpaAutoConfiguration.class,
    KafkaAutoConfiguration.class
})
@SpringBootTest(properties = {
    "spring.profiles.active=test",
    "spring.autoconfigure.exclude=org.springframework.cloud.netflix.eureka.EurekaClientAutoConfiguration"
})
class AuthServiceApplicationTests {

    @Test
    void contextLoads() {
    }

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private KafkaTemplate<String, NotificationEvent> kafkaTemplate;
}


