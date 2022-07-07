<br/>

<p align="center">
    <img src="./assets/logo.png" width="218px"  alt="Stencil logo" />
</p>

<h3 align="center">API queries made simple, typesafe and fast.</h3>
<p align="center">An easy-to-use solution to generate queries for the REST API provided by
popular headless CMS <a href="https://github.com/strapi/strapi">Strapi</a>.</p>

## Why was this build?

Since version V4 of [Strapi](https://github.com/strapi/strapi) we have more control over filtering and controlling relations when using the REST API, this also introduces some complexity to requesting an API. Stencil aims to reduce this complexity.

## Benefits

Stencil offers two methods to build and parse queries using package [qs](https://github.com/ljharb/qs) under the hood as seen in the docs of [Strapi](https://docs.strapi.io/developer-docs/latest/developer-resources/database-apis-reference/rest/filtering-locale-publication.html#filtering). This is Stencil's only direct dependency thus staying lightweight.

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
    relation: {
        property: string;
    }
}

// offers perfect autocomplete with single generic
const query = Stencil.stringify<Test>({
    filters: {
        id: { $ne: 21 },
        images: {
            url: { $contains: "placehold.it" },
        },
        relation: {
            property: { $in: ["example"] }
        }
    }
});
```
