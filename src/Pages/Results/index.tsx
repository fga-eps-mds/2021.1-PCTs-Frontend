import React, { useEffect, useState } from "react";
import moment from "moment";

import SearchBar from "../../Components/SearchBar";
import Header from "../../Components/Header";
import Footer from "../../Components/Footer";
import ResultCard from "../../Components/ResultCard";

import Flatlist from "flatlist-react";
import Loader from "react-loader-spinner";

import {
  Container as PageContainer,
  NewResultsContainer,
  SearchAreaContainer,
} from "./styles";
import { apiDocuments } from "../../services/apiDocuments";
import { apiCrawlersNoAuth } from "../../services/apiCrawlers";
import { useRouteMatch } from "react-router";
import { Row, Col, Button } from "react-bootstrap";

import SelectFilter from "../../Components/SelectFilter";
import DateFilterModal from "../../Components/DateFilterModal";

import { SourceResult } from "../../Components/SourceItem";
import axios from "axios";

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

type DocumentsResponse = {
  count: number;
  next: string;
  previous: string;
  results: Array<DocumentResult>;
};

type SourcesResponse = {
  count: number;
  next: string;
  previous: string;
  results: Array<SourceResult>;
};

type PeriodFilter = {
  id: number;
  periodName: string;
  date_lte: string;
  date_gte: string;
};

type CategoryFilter = {
  id: number;
  categoryName: string;
};

interface ResultsParams {
  searchTerm: string;
}

const Results: React.FC = () => {
  const [documentsResponse, setDocumentsResponse] =
    useState<DocumentsResponse>();
  const [availableSources, setAvailableSources] = useState<SourceResult[]>();
  const [availableCategories] = useState<CategoryFilter[]>([
    { id: 1, categoryName: "Quilombolas" },
    { id: 2, categoryName: "Território" },
    { id: 3, categoryName: "Conflito" },
  ]);

  const CUSTOM_PERIOD_FILTER = {
    id: 5,
    periodName: "Customizado",
    date_gte: "",
    date_lte: "",
  };
  const [availablePeriods] = useState([
    {
      id: 1,
      periodName: "Ontem",
      date_gte: moment().subtract(1, "day").format(),
      date_lte: moment().format(),
    },
    {
      id: 2,
      periodName: "Semana passada",
      date_gte: moment().subtract(7, "day").format(),
      date_lte: moment().format(),
    },
    {
      id: 3,
      periodName: "Mês passado",
      date_gte: moment().subtract(1, "month").format(),
      date_lte: moment().format(),
    },
    {
      id: 4,
      periodName: "Ano passado",
      date_gte: moment().subtract(1, "year").format(),
      date_lte: moment().format(),
    },
    CUSTOM_PERIOD_FILTER,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { params } = useRouteMatch<ResultsParams>();
  const [searchTerm, setSearchTerm] = useState(params.searchTerm);
  const [selectedSource, setSelectedSource] = useState<string>();
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>();
  const [download, setDownload] = useState('');

  const [showDateFilterModal, setShowDateFilterModal] = useState(false);

  useEffect(() => {
    document.title = "Resultado";
  }, []);

  useEffect(() => {
    getDocuments();
    getSources();
  }, []);

  useEffect(() => {
    getDocuments();
  }, [selectedSource, selectedCategory, selectedPeriod]);

  const getDocuments = async () => {
    setIsLoading(true);
    try {
      let filters = `?q=${searchTerm}`;
      filters += selectedSource ? `&source=${selectedSource}` : "";
      filters += selectedCategory ? `&category=${selectedCategory}` : "";

      if (selectedPeriod) {
        filters += selectedPeriod.date_lte
          ? `&date-lte=${selectedPeriod?.date_lte}`
          : "";
        filters += selectedPeriod.date_gte
          ? `&date-gte=${selectedPeriod?.date_gte}`
          : "";
      }

      const { data } = await apiDocuments.get(`api/documents/${filters}`);
      setDocumentsResponse(data);
    } catch (error) {
      alert("Ocorreu um erro ao buscar os documentos!");
    }
    
    setIsLoading(false);
  };

  const getSources = async () => {
    let sources: SourceResult[] = [];

    let { data } = await apiCrawlersNoAuth.get<SourcesResponse>(`api/crawlers/`);

    sources = sources.concat(data["results"]);

    // Recupera o restante das fontes pela paginacao
    while (data["next"]) {
      data = await getMoreSources(data);
      sources = sources.concat(data["results"]);
    }

    setAvailableSources(sources);
  };

  const getMoreSources = async (currentSourcesResponse: SourcesResponse) => {
    const { data } = await apiCrawlersNoAuth.get<SourcesResponse>(
      `${currentSourcesResponse.next}`
    );
    return data;
  };

  const getMoreDocuments = async () => {
    const { data } = await apiDocuments.get<DocumentsResponse>(
      `${documentsResponse?.next}`
    );
    if (documentsResponse?.results) {
      let myDocuments: Array<DocumentResult> = documentsResponse?.results;
      myDocuments = [...myDocuments, ...data.results];

      const newDocumentsResponse = {
        count: data.count,
        next: data.next,
        previous: data.previous,
        results: myDocuments,
      };

      setDocumentsResponse(newDocumentsResponse);
    }
  };

  const renderResultCard = (result: DocumentResult) => {
    return <ResultCard key={result?.id} item={result} />;
  };

  const filterSource = (source: SourceResult) => {
    setSelectedSource(source?.site_name);
  };

  const filterCategory = (category: CategoryFilter) => {
    setSelectedCategory(category?.categoryName);
  };

  const filterPeriod = (period: PeriodFilter) => {
    if (period?.id == CUSTOM_PERIOD_FILTER.id) {
      setShowDateFilterModal(true);
    } else {
      setSelectedPeriod(period);
    }
  };

  const filterCustomPeriod = (date_gte: string, date_lte: string) => {
    setSelectedPeriod({
      id: 4,
      periodName: "Customizado",
      date_gte: date_gte,
      date_lte: date_lte,
    });
    setShowDateFilterModal(false);
  };
  
  const exportDocuments = () => {
    try {
      let filters = `?q=${searchTerm}`;
      filters += selectedSource ? `&source=${selectedSource}` : "";
      filters += selectedCategory ? `&category=${selectedCategory}` : "";

      if (selectedPeriod) {
        filters += selectedPeriod.date_lte
          ? `&date-lte=${selectedPeriod?.date_lte}`
          : "";
        filters += selectedPeriod.date_gte
          ? `&date-gte=${selectedPeriod?.date_gte}`
          : "";
      }
      const exportFile = `https://pcts-documents-api-dev.herokuapp.com/api/documents/export/` + filters;
      setDownload(exportFile);
    
    } catch (error) {
      alert("Ocorreu um erro ao exportar a pesquisa!");
    }
  };

  return (
    <PageContainer>
      <Header />
      <DateFilterModal
        show={showDateFilterModal}
        onClose={() => setShowDateFilterModal(false)}
        onSelected={filterCustomPeriod}
      />
      <NewResultsContainer>
        <h2 className="results-title">Resultados</h2>
        {/* <Row style={{ width: "80%", marginBottom: "20px" }}> */}
        <SearchAreaContainer>
          <SearchBar
            ableToSearch={searchTerm === "" ? false : true}
            searchTerm={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value);
            }}
          />
          <Row className="justify-content-md-start" style={{ width: "100%"}}>
            <Col sm lg="2" style={{ padding: "0px", paddingRight: "0.5vh" }}>
              <SelectFilter
                items={availableSources}
                idAttr="id"
                displayAttr="site_name_display"
                defaultItem="Todas as fontes"
                onSelect={filterSource}
              />
            </Col>
            <Col sm lg="2" style={{ padding: "0px", paddingRight: "0.5vh" }}>
              <SelectFilter
                items={availableCategories}
                idAttr="id"
                displayAttr="categoryName"
                defaultItem="Todas categorias"
                onSelect={filterCategory}
              />
            </Col>
            <Col sm lg="3" style={{ padding: "0px", paddingRight: "0.5vh" }}>
              <SelectFilter
                items={availablePeriods}
                idAttr="id"
                displayAttr="periodName"
                defaultItem="Qualquer momento"
                onSelect={filterPeriod}
              />
            </Col>
            <Col sm lg="2" style={{ padding: "0px", paddingRight: "0.5vh", height: '100%' }}>
              <Button variant="success" style={{ backgroundColor: 'green', color: 'white', marginLeft: "5%" }} onClick={exportDocuments}>Exportar Pesquisa</Button>
              {download && <iframe src={download} style={{display: "none"}}></iframe>}
            </Col>
          </Row>
        </SearchAreaContainer>
        {/* </Row> */}

        {isLoading === true ? (
          <Loader type="ThreeDots" color="#004346" height={50} width={50} />
        ) : (
          <>
            <p>
              {documentsResponse?.count
                ? `${documentsResponse?.count} registros encontrados`
                : ""}
            </p>
            <Flatlist
              list={documentsResponse?.results}
              renderItem={(item: DocumentResult) => renderResultCard(item)}
              renderWhenEmpty={() => (
                <div>
                  <h2>Não foi possível encontrar resultados!</h2>
                </div>
              )}
              hasMoreItems={documentsResponse?.next === null ? false : true}
              loadMoreItems={() => getMoreDocuments()}
              paginationLoadingIndicator={
                <Loader
                  type="ThreeDots"
                  color="#004346"
                  height={50}
                  width={50}
                />
              }
            />
          </>
        )}
      </NewResultsContainer>
      <Footer />
    </PageContainer>
  );
};

export default Results;
