package xyz.esion.video.config;

import com.baomidou.mybatisplus.extension.ddl.SimpleDdl;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * @author esion
 * @since 2024年3月25日
 */
@Component
public class MysqlDdl extends SimpleDdl {

    /**
     * 执行 SQL 脚本方式
     */
    @Override
    public List<String> getSqlFiles() {
        return List.of(
                // 内置包方式
                "db/schema.sql"
        );
    }
}
