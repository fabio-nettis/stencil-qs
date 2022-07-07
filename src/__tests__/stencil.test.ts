import Stencil from '../../dist/classes/stencil';

interface TestType {
  id: number;
  name: string;
  hashtag: string;
  likes: Array<{ userId: string }>;
  type: 'PRIVATE' | 'PUBLIC';
  image: {
    url: string;
  };
}

describe('Stringify method works properly', () => {
  it('Check type safety', () => {
    const query = Stencil.stringify<TestType>({
      fields: ['id'],
      populate: ['hashtag', 'test', 'image'],
      filters: {
        id: { $between: [1, 100] },
        name: { $containsi: 'top' },
        hashtag: { $null: true },
        likes: { userId: { $null: false } },
        type: { $eq: 'PRIVATE' },
        image: { url: { $eq: 'test' } },
      },
    });

    const obj = Stencil.parse<TestType>(query);

    expect(obj).toHaveProperty('filters.id.$between');
  });
});
