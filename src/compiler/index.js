/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
/**
 * 在这之前做的所有的事情，只有一个目的，就是为了构建平台特有的编译选项options，如web平台
 * 将模板解析成ast
 * 对ast树进行静态标记
 * 将ast生成渲染函数
 */
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  // 将模板解析为ast，每个节点的ast对象上都设置了元素的所有信息，如：标签信息、属性信息、插槽信息、父节点、子节点等
  // 具体有哪些属性，查看 start 和 end 这两个处理开始和结束标签的方法
  const ast = parse(template.trim(), options)
  // 优化，遍历ast，为每个节点做静态标记
  // 标记每个节点是否为静态节点，然后进一步标记出静态根节点
  // 这样在后续更新中就可以跳过这些静态节点了
  // 标记静态根，用于生成渲染函数阶段，生成静态根节点的渲染函数
  if (options.optimize !== false) {
    optimize(ast, options)
  }
  // 从ast生成渲染函数
  const code = generate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
