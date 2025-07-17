package xyz.esion.video.config;


import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.module.SimpleModule;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;


/**
 * @author Administrator
 */
@Configuration
@RequiredArgsConstructor
public class JacksonConfiguration {

    // date 序列化格式
    private final static String SERIALIZER_DATE_PATTERN = "yyyy-MM-dd";
    // date 反序列化格式
    private final static List<String> DESERIALIZER_DATE_PATTERNS = Arrays.asList("yyyy-MM-dd", "yyyy-M-d");
    // dateTime 序列化格式
    private final static String SERIALIZER_DATETIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    // dateTime 反序列化格式
    private final static List<String> DESERIALIZER_DATETIME_PATTERNS = Collections.singletonList("yyyy-MM-dd HH:mm:ss");
    // 空日期前缀
    private final static String NULL_DATE_PREFIX = "1972-01-01";

    private final ObjectMapper objectMapper;


    @PostConstruct
    public void registerModule() {
        SimpleModule simpleModule = new SimpleModule();
        // LocalDate 序列化
        simpleModule.addSerializer(LocalDate.class, new JsonSerializer<>() {
            @Override
            public void serialize(LocalDate value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
                if (value == null) {
                    gen.writeString("");
                    return;
                }
                String str = value.format(DateTimeFormatter.ofPattern(SERIALIZER_DATE_PATTERN));
                if (str.startsWith(NULL_DATE_PREFIX)) {
                    gen.writeString("");
                    return;
                }
                gen.writeString(str);
            }
        });
        // LocalDate 反序列化
        for (String datePattern : DESERIALIZER_DATE_PATTERNS) {
            simpleModule.addDeserializer(LocalDate.class, new JsonDeserializer<>() {
                @Override
                public LocalDate deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException {
                    if (StringUtils.isEmpty(jsonParser.getText())) {
                        return null;
                    }
                    try {
                        return LocalDate.parse(jsonParser.getText(), DateTimeFormatter.ofPattern(datePattern));
                    } catch (Exception e) {
                        throw new IllegalArgumentException(StrUtil.format("参数【{}】，值【{}】格式错误，应为【{}】",
                                jsonParser.getCurrentName(),
                                jsonParser.getText(),
                                datePattern));
                    }
                }
            });
        }
        // LocalDateTime 序列化
        simpleModule.addSerializer(LocalDateTime.class, new JsonSerializer<>() {
            @Override
            public void serialize(LocalDateTime value, JsonGenerator gen, SerializerProvider serializers) throws IOException {
                if (value == null) {
                    gen.writeString("");
                    return;
                }
                String str = value.format(DateTimeFormatter.ofPattern(SERIALIZER_DATETIME_PATTERN));
                if (str.startsWith(NULL_DATE_PREFIX)) {
                    gen.writeString("");
                    return;
                }
                gen.writeString(str);

            }
        });
        // LocalDateTime 反序列化
        for (String datePattern : DESERIALIZER_DATETIME_PATTERNS) {
            simpleModule.addDeserializer(LocalDateTime.class, new JsonDeserializer<>() {
                @Override
                public LocalDateTime deserialize(JsonParser jsonParser, DeserializationContext deserializationContext) throws IOException {
                    if (StringUtils.isEmpty(jsonParser.getText())) {
                        return null;
                    }
                    try {
                        return LocalDateTime.parse(jsonParser.getText(), DateTimeFormatter.ofPattern(datePattern));
                    } catch (Exception e) {
                        throw new IllegalArgumentException(StrUtil.format("参数【{}】，值【{}】格式错误，应为【{}】",
                                jsonParser.getCurrentName(),
                                jsonParser.getText(),
                                datePattern));
                    }
                }
            });
        }

        objectMapper.registerModule(simpleModule);
    }

}
