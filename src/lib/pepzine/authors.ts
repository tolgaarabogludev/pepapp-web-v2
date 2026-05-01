export interface Author {
  name: string;
  role: string;
  bio: string;
}

const AUTHORS: Record<string, Author> = {
  "Pep Ekibi": {
    name: "Pep Ekibi",
    role: "Pepapp Editöryal Ekibi",
    bio: "Pepapp'ın sağlık, döngü bilimi ve kadın refahı alanında uzman editöryal ekibi tarafından hazırlanmıştır. İçeriklerimiz güncel araştırmalar ve klinik uzman görüşlerine dayanmaktadır.",
  },
};

const DEFAULT_AUTHOR = AUTHORS["Pep Ekibi"];

export function getAuthor(name: string): Author {
  return AUTHORS[name] ?? DEFAULT_AUTHOR;
}
