<template>
  <div class="empty-state">
    <t-icon name="inbox" size="64px" />
    <h3>暂无内容</h3>
    <p>请选择一个随机源或稍后再试</p>
    <t-button theme="primary" @click="$emit('refresh')">
      重新加载
    </t-button>
  </div>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'refresh'): void
}

defineEmits<Emits>()
</script>

<style scoped lang="less">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-primary);
  text-align: center;
  
  h3 {
    margin: 16px 0 8px 0;
    font-size: 24px;
    font-weight: 600;
  }
  
  p {
    margin: 0 0 24px 0;
    opacity: 0.8;
    font-size: 16px;
  }
}
</style>