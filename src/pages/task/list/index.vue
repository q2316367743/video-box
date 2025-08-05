<template>
  <div class="task-list-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>任务管理</h2>
    </div>
    <!-- 任务执行中表格 -->
    <task-running-table />
    <!-- 任务定义表格 -->
    <task-definition-table/>
  </div>
</template>

<script setup lang="ts">
import TaskDefinitionTable from "@/pages/task/list/components/TaskDefinitionTable.vue";
import TaskRunningTable from "@/pages/task/list/components/TaskRunningTable.vue";


</script>

<style scoped>
.task-list-page {
  padding: 24px;
  background-color: var(--td-bg-color-page);
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: var(--td-text-color-primary);
  font-size: 24px;
  font-weight: 600;
}

</style>