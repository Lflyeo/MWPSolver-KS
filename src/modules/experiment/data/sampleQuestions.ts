import type { QuestionItem } from '../types/experiment';

export const sampleQuestions: QuestionItem[] = [
  {
    id: 'q-001',
    title: '分数应用题',
    content: `**【题目】**

某班共有 40 名学生，其中女生人数是男生人数的 $\\frac{3}{5}$。

(1) 求男生人数；

(2) 求女生人数。`,
  },
  {
    id: 'q-002',
    title: '行程问题',
    content: `**【题目】**

小明从家到学校需要 20 分钟，平均速度为 60 米/分钟。学校到图书馆的距离是 900 米。

(1) 求家到学校的距离；

(2) 若小明以相同速度从家出发，先到学校再到图书馆，共需多少分钟？`,
  },
  {
    id: 'q-003',
    title: '比例问题',
    content: `**【题目】**

某工厂生产 A、B 两种产品，A 产品与 B 产品的产量之比为 $3:2$。已知 A 产品比 B 产品多生产 120 件。

(1) 求 A 产品的产量；

(2) 求两种产品的总产量。`,
  },
];
