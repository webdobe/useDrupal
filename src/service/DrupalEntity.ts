/**
 * The Attributes interface serves as a generic key-value store for entity attributes.
 */
interface Attributes {
  [key: string]: any;
}

/**
 * The Relationship interface represents the data of a relationship in an entity.
 */
interface Relationship {
  data: any;
}

/**
 * The Relationships interface serves as a generic key-value store for entity relationships.
 */
interface Relationships {
  [key: string]: Relationship;
}

/**
 * The Entity interface describes the structure of an entity.
 */
interface Entity {
  id: string;
  type: string;
  attributes?: Attributes;
  relationships?: Relationships;
}

/**
 * The EntityData interface represents a key-value store where each key is a type
 * and each value is an object where each key is an ID and each value is an Entity.
 */
interface EntityData {
  [key: string]: { [key: string]: Entity };
}

/**
 * The DrupalEntity class represents a Drupal entity.
 */
class DrupalEntity {
  _id?: string;
  _type: string;
  _data?: EntityData | {};

  /**
   * The constructor takes an id, type, and optionally a data object.
   */
  constructor(id: string, type: string, data?: EntityData | {}) {
    this._id = id;
    this._type = type;
    this._data = data;

    if (!id && data) {
      this.getEntityByType();
    }
  }

  // Getter and Setter for id
  set id (id) {
    this._id = id;
  }

  get id () {
    return this._id;
  }

  // Getter and Setter for type
  set type (type) {
    this._type = type;
  }

  get type () {
    return this._type;
  }

  // Getter and Setter for data
  set data(value: EntityData | {}) {
    if (Object.keys(value).length === 0) {
      this._data = {};
    } else {
      this._data = value as EntityData;
      this.getEntityByType();
    }
  }

  get data() {
    return this._data;
  }

  /**
   * The getEntityByType method is used to update the id and type of the current entity based on its type.
   */
  getEntityByType () {
    const entity: Entity = Object.values(this.data[this.type])[0] as Entity;
    if (entity) {
      this.id = entity.id;
      this.type = entity.type;
    }
  }

  /**
   * The getValue method is used to retrieve the value of a given attribute or relationship.
   */
  getValue(value: string): any {
    const entity: Entity = this.data[this.type][this.id];
    if (entity) {
      // Check if value is in attributes
      if (entity.attributes && entity.attributes[value]) {
        return entity.attributes[value];
      }
      // Check if value is in relationships
      else if (entity.relationships && entity.relationships[value]) {
        return this.getRelationship(value);
      }
    }
  }

  /**
   * The getRelationship method is used to retrieve a relationship as a DrupalEntity or an array of DrupalEntities.
   */
  getRelationship(value: string): DrupalEntity | DrupalEntity[] {
    const entity: Entity = this.data[this.type][this.id];
    const relationshipData = entity.relationships[value].data;
    if (relationshipData) {
      if (Array.isArray(relationshipData)) {
        // If relationship data is an array, map each item to a new DrupalEntity
        return relationshipData.map(item => new DrupalEntity(item.id, item.type, this.data));
      } else {
        // If relationship data is an object, return a new DrupalEntity
        return new DrupalEntity(relationshipData.id, relationshipData.type, this.data);
      }
    }
  }
};

export default DrupalEntity;