package xyz.esion.video.config;

import cn.hutool.core.util.IdUtil;
import com.baomidou.mybatisplus.core.incrementer.IdentifierGenerator;
import org.springframework.stereotype.Component;

/**
 * @author esion
 * @since 2024年3月25日
 */
@Component
public class CustomIdGenerator implements IdentifierGenerator {

    @Override
    public Long nextId(Object entity) {
        // 返回生成的ID值
        return IdUtil.getSnowflakeNextId();
    }

}