/// <reference types="vite/client" />

// React 19 removed the global JSX namespace.
// Re-declare it to avoid updating every component file.
import type React from 'react';
declare global {
  namespace JSX {
    type Element = React.JSX.Element;
    type ElementType = React.JSX.ElementType;
    type IntrinsicElements = React.JSX.IntrinsicElements;
    type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
    interface ElementClass extends React.Component<never> {
      render(): React.ReactNode;
    }
    interface ElementAttributesProperty {
      props: object;
    }
    interface ElementChildrenAttribute {
      children: object;
    }
    interface IntrinsicAttributes extends React.Attributes {}
    interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
  }
}
