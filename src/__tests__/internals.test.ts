import Stencil from '../classes/stencil';
import Internals from '../classes/internals';

interface TestType {
  id: number;
  no: string;
  imageUrl: string;
  unitCode: {
    id: number;
    full: string;
    iso: string;
  };
  image: {
    data: null;
  };
  payment: {
    address: {
      id: number;
      code: string;
    };
  };
  categories: [
    {
      id: number;
      code: string;
    },
  ];
}

function getLocalTestData() {
  return {
    data: [
      {
        id: 1,
        attributes: {
          no: 'TEST',
          imageUrl: 'htto://localhost:1337/api/products/1/image',
          unitCode: {
            id: 1,
            full: 'Stück',
            iso: 'STK',
          },
          image: {
            data: null,
          },
          payment: {
            address: {
              data: {
                id: 1,
                attributes: {
                  code: 'TEST',
                },
              },
            },
          },
          categories: {
            data: [
              {
                id: 1,
                attributes: {
                  code: 'TEST',
                },
              },
            ],
          },
        },
      },
    ],
  };
}

describe('Transformation of unified data structure works as expected.', () => {
  it('Flatten util works with array entities.', () => {
    const data = getLocalTestData();
    const products = Stencil.api.flatten<Array<TestType>>(data);

    expect(products).toHaveLength(1);
    expect(products?.[0]).toHaveProperty('id');
    expect(products?.[0]).toHaveProperty('no');
    expect(products?.[0]).toHaveProperty('imageUrl');
    expect(products?.[0]).toHaveProperty('categories');
    expect(products?.[0]).toHaveProperty('unitCode');
    expect(products?.[0].categories?.[0]).toHaveProperty('id');
    expect(products?.[0].categories?.[0]).toHaveProperty('code');

    expect((products?.[0] as any).image).toBe(null);
    expect(products?.[0].unitCode).toHaveProperty('iso');
  });

  it('Flatten util works with single entities.', () => {
    const data = getLocalTestData();
    const product = Stencil.api.flatten<TestType>({ data: data.data[0] });
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('no');
    expect(product).toHaveProperty('imageUrl');
    expect(product).toHaveProperty('categories');
    expect(product?.categories?.[0]).toHaveProperty('id');
    expect(product?.categories?.[0]).toHaveProperty('code');
  });

  it('Internals have expected helpers', () => {
    expect(Internals.struct).toBeDefined();
    expect(Internals.isNull).toBeDefined();
    expect(Internals.isProperty).toBeDefined();
    expect(Internals.isComponent).toBeDefined();
  });
});
