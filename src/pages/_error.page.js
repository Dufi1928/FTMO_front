export { Page }
import { h } from 'vue'

const Page = ({ is404 }) => {
  return h('h1', null, is404 ? 'Page Not Found' : 'An error occurred')
}
