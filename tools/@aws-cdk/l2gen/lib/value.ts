import { IType, ANY } from './type';
import { CM2, IRenderable, CodePart } from './cm2';

export interface IValue extends IRenderable {
  readonly type: IType;
  toString(): string;
}

export class ObjectLiteral implements IValue {
  private readonly fields = new Map<string, IRenderable>();

  constructor(public readonly type: IType = ANY) {
  }

  public set1(key: string, value: IRenderable) {
    if (this.fields.has(key)) {
      throw new Error(`Already has a value: ${key}`);
    }

    this.fields.set(key, value);
  }

  public set(fields: Record<string, IRenderable>) {
    for (const [key, value] of Object.entries(fields)) {
      this.set1(key as any, value as any);
    }
  }

  public has(field: string) {
    return this.fields.has(field);
  }

  public combine(rhs: ObjectLiteral) {
    const ret = new ObjectLiteral(this.type);
    ret.set(Object.fromEntries(this.fields));
    ret.set(Object.fromEntries(rhs.fields));
    return ret;
  }

  public toString(): string {
    return '{...object...}';
  }

  public render(code: CM2): void {
    code.indent('  ');
    code.write('{\n');
    for (const [k, v] of this.fields.entries()) {
      code.add(k as string, `: `, v, ',\n');
    }
    code.unindent();
    code.write('}');
  }
}

export function objLit(xs: Record<string, IRenderable>): ObjectLiteral {
  const x = new ObjectLiteral();
  x.set(xs);
  return x;
}

export function litVal(x: CodePart | CodePart[], type: IType = ANY): IValue {
  return {
    type,
    render(code) {
      if (Array.isArray(x)) {
        code.add(...x);
      } else {
        code.add(x);
      }
    },
    toString: () => `${x}`,
  };
}