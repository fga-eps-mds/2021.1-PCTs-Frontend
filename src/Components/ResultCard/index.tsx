import React from "react";
import { ButtonProps, Col, Row } from "react-bootstrap";
import moment from "moment";

import {
  Container,
  ResultCategories,
  ResultCategoriesContainer,
  ResultCategoriesText,
  ResultDate,
  ResultLink,
  ResultTitle,
  TitleDateContainer,
} from "./styles";

interface DocumentResult {
  id: number;
  source: string;
  url: string;
  slug: string;
  title: string;
  content: string;
  checksum: string;
  updated_at: string;
  created_at: string;
  classification: string;
}

interface ResultCardProps extends ButtonProps {
  item: DocumentResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ item }) => {
  const openLink = () => {
    window.open(item.url, "_blank");
  };

  return (
    <Container onClick={() => openLink()}>
      <TitleDateContainer>
        <ResultTitle>{item.title}</ResultTitle>
        <ul>
          <li>
            <ResultDate>Encontrado em:</ResultDate>
          </li>
          <li>
            <ResultDate>
              {moment(item.created_at).format("DD/MM/YYYY HH:mm")}
            </ResultDate>
          </li>
        </ul>
      </TitleDateContainer>
      <ResultLink href={item.url} target="_blank">
        {item.url}
      </ResultLink>

      <Row className="g-4">
        <Col>
          <ResultCategoriesText>Fonte</ResultCategoriesText>
          <ResultCategoriesContainer>
            {item?.source && (
              <ResultCategories>
                <text>{item.source}</text>
              </ResultCategories>
            )}
          </ResultCategoriesContainer>
        </Col>
        <Col>
          <ResultCategoriesText>Categorias</ResultCategoriesText>
          <ResultCategoriesContainer>
            {item?.classification && (
              <ResultCategories>
                <text>{item.classification}</text>
              </ResultCategories>
            )}
          </ResultCategoriesContainer>
        </Col>
      </Row>
    </Container>
  );
};

export default ResultCard;
