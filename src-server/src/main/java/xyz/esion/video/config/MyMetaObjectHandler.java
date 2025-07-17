package xyz.esion.video.config;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * @author esion
 * @since 2024年3月25日
 */
@Slf4j
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        log.info("开始插入填充...");
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        if (StpUtil.isLogin()) {
            this.strictInsertFill(metaObject, "createId", String.class, StpUtil.getLoginIdAsString());
            this.strictInsertFill(metaObject, "updateId", String.class, StpUtil.getLoginIdAsString());
        } else {
            this.strictInsertFill(metaObject, "createId", String.class, "");
            this.strictInsertFill(metaObject, "updateId", String.class, "");
        }
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        log.info("开始更新填充...");
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
        if (StpUtil.isLogin()) {
            this.strictInsertFill(metaObject, "updateId", String.class, StpUtil.getLoginIdAsString());
        } else {
            this.strictInsertFill(metaObject, "updateId", String.class, "");
        }
    }
}
