<br/>

<p align="center">
    <img src="./assets/logo.png" width="218px"  alt="Stencil logo" />
</p>

<h3 align="center">API queries made simple, typesafe and fast.</h3>
<p align="center">An easy-to-use solution to generate queries for the REST API provided by
popular headless CMS <a href="https://github.com/strapi/strapi">Strapi</a>.</p>

<br/>

## Why was this build?

Since version V4 of [Strapi](https://github.com/strapi/strapi) we have more control over filtering and controlling relations when using the REST API, this also introduces some complexity to requesting an API. Stencil aims to reduce this complexity.

## Installation

```bash
npm install stencil-qs
```

or if you are using yarn

```bash
yarn add stencil-qs
```

## Usage

You can use Stencil to either create or read query strings used to interact with the
REST API.

```typescript
interface Test {
    id: number;
    // array types are also supported
    images: Array<{ url: string }>;
    relation: {  property: string; }
}

const query = Stencil.stringify<Test>({
    filters: {
      id: { 
       $ne: 21 
      },
      images: {
        url: { $contains: "placehold.it" }, 
      },
      relation: { 
        property: { $in: ["example"] }
      }
    }
});
```

## Helpers

The current version of Stencil.qs not only includes the type safe query string builder but some brand new features like:

### Response Helper

A new function that can be used to flatten any response from the API. The response is usually a deeply nested object (unified response format). This function will loop through each property of the object and remove all nesting.

- [x] Supports nested objects
- [x] Supports arrays
- [x] Supports null values
- [x] Supports components
- [x] Supports dynamic zones

Keep in mind When using this function, that the response is not always in the unified response format, like in the users-permissions plugin, if no data key is found in the response the function will throw accordingly.

### Localization Helper

With the new `i18n.single` and `i18n.array` you are able to not only flatten but automatically localize your content types received from the API.

Both of the new helpers are completely type safe and you can pass the available locales as well as the content type that the response represents after being flattenend.

```typescript
import Stencil from 'stencil-qs';

type Locales = "de" | "en";
type Article = { id: string, title: string, description: string };

// create query and include localizations
const query = Stencil.stringify<Article[]>({ populate["localizations"] });
const response = await (await fetch(`/articles?${query}`)).json();

// would return Record<Locale, Article>[];
const articles = Stencil.i18n.array<Locales, Article>(response); 
```
