export function createCustomElement({ tag, tagClass, elType, attr, listener }) {
  const template = document.createElement('template');
  const content = template.cloneNode(true);
  const element = document.createElement(tag);

  tagClass && (element.className = tagClass);
  elType && (element.type = elType);
  listener && element.addEventListener(listener.type, listener.action, listener?.options);
  attr && element.setAttribute(attr.name, attr.value);
  content.append(element);

  return content.firstChild;
};