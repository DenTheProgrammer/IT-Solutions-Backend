import { parse, print } from 'graphql';

export const fullProfileFields = `
  id slug fullName headline summary location workFormat
  links { id kind label url }
  skills { id name category details }
  experiences {
    id company position startDate endDate isCurrent
    achievements { id text }
  }
  projects { id name description url repositoryUrl isRepositoryPrivate technologies }
`;

export const fullProfileQuery = print(
  parse(`
  query FullProfile($slug: String!) {
    profile(slug: $slug) { ${fullProfileFields} }
  }
`),
);
