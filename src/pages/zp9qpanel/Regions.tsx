import { Create, Edit, useForm } from "@refinedev/antd";
import {
  Form,
  Input,
  Tag,
  Space,
  Button,
  Spin,
  Typography,
  Collapse,
  Col,
  Row,
  Card,
  Tooltip,
  App,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  GlobalOutlined,
  ExclamationCircleOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import type { IResourceComponentsProps } from "@refinedev/core";
import { useList, useDelete } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";

const { Panel } = Collapse;
const { Title, Text } = Typography;

export const RegionList: React.FC<IResourceComponentsProps> = () => {
  const navigate = useNavigate();
  const { mutate: deleteOne } = useDelete();
  const { modal } = App.useApp();

  const { data: regionsData, isLoading: regionsLoading } = useList({
    resource: "regions",
    pagination: { pageSize: 1000 },
  });

  const { data: citiesData, isLoading: citiesLoading } = useList({
    resource: "cities",
    pagination: { pageSize: 1000 },
  });

  const { data: pharmaciesData, isLoading: pharmaciesLoading } = useList({
    resource: "pharmacies",
    pagination: { pageSize: 1000 },
  });

  if (regionsLoading || citiesLoading || pharmaciesLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  const regions = regionsData?.data ?? [];
  const cities = citiesData?.data ?? [];
  const pharmacies = pharmaciesData?.data ?? [];

  const handleDeleteRegion = (id: string | number) => {
    modal.confirm({
      title: "Delete Region",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this region?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        deleteOne({
          resource: "regions",
          id,
          mutationMode: "pessimistic",
          successNotification: { message: "Region deleted", type: "success" },
        });
      },
    });
  };

  const handleDeleteCity = (id: string | number) => {
    modal.confirm({
      title: "Delete City",
      icon: <ExclamationCircleOutlined />,
      content: "Are you sure you want to delete this city?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        deleteOne({
          resource: "cities",
          id,
          mutationMode: "pessimistic",
          successNotification: { message: "City deleted", type: "success" },
        });
      },
    });
  };

  return (
    <div>
      <style>{`
        @media (max-width: 576px) {
          .region-page-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }

          .region-header-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .region-panel-header {
            flex-wrap: wrap;
            gap: 6px;
          }

          .region-panel-tags {
            display: none;
          }
        }
      `}</style>

      <div
        className="region-page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Regions & Cities
          </Title>
          <Text type="secondary">
            {regions.length} regions · {cities.length} cities total
          </Text>
        </div>
        <Space className="region-header-actions">
          <Button
            onClick={() => navigate("/zp9qpanel/cities/create")}
            icon={<PlusOutlined />}
          >
            Add City
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/zp9qpanel/regions/create")}
          >
            Add Region
          </Button>
        </Space>
      </div>

      <Collapse
        accordion={false}
        defaultActiveKey={regions.map((r) => String(r.id))}
        style={{ background: "transparent", border: "none" }}
      >
        {[...regions]
          .sort((a, b) =>
            String(a.name ?? "").localeCompare(String(b.name ?? "")),
          )
          .map((region) => {
            const regionCities = cities.filter(
              (c) => String(c.region_id) === String(region.id),
            );
            const totalPharmacies = regionCities.reduce((acc, city) => {
              return (
                acc +
                pharmacies.filter((p) => String(p.city_id) === String(city.id))
                  .length
              );
            }, 0);

            return (
              <Panel
                key={String(region.id)}
                style={{
                  borderRadius: 10,
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  marginBottom: 12,
                  background: "#fff",
                }}
                header={
                  <div
                    className="region-panel-header"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flex: 1,
                    }}
                  >
                    <Space wrap>
                      <GlobalOutlined style={{ color: "#1976d2" }} />
                      <Text strong style={{ fontSize: 15 }}>
                        {region.name_en ?? region.name}
                      </Text>
                      {region.name_ar && (
                        <Text
                          type="secondary"
                          style={{ direction: "rtl", fontSize: 13 }}
                        >
                          ({region.name_ar})
                        </Text>
                      )}
                      <span className="region-panel-tags">
                        <Space size={4}>
                          <Tag color="blue">{regionCities.length} cities</Tag>
                          <Tag color="green">{totalPharmacies} pharmacies</Tag>
                        </Space>
                      </span>
                    </Space>
                    <Space
                      size={4}
                      onClick={(e) => e.stopPropagation()}
                      style={{ marginLeft: 16 }}
                    >
                      <Tooltip title="Edit Region">
                        <Button
                          icon={<EditOutlined />}
                          size="small"
                          type="text"
                          onClick={() =>
                            navigate(`/zp9qpanel/regions/edit/${region.id}`)
                          }
                        />
                      </Tooltip>
                      <Tooltip title="Delete Region">
                        <Button
                          icon={<DeleteOutlined />}
                          size="small"
                          type="text"
                          danger
                          onClick={() =>
                            handleDeleteRegion(region.id as string)
                          }
                        />
                      </Tooltip>
                    </Space>
                  </div>
                }
              >
                {regionCities.length === 0 ? (
                  <Text
                    type="secondary"
                    style={{ padding: "8px 0", display: "block" }}
                  >
                    No cities in this region yet.
                  </Text>
                ) : (
                  <Row gutter={[12, 12]} style={{ padding: "4px 0" }}>
                    {[...regionCities]
                      .sort((a, b) =>
                        String(a.name).localeCompare(String(b.name)),
                      )
                      .map((city) => {
                        const cityPharmacyCount = pharmacies.filter(
                          (p) => String(p.city_id) === String(city.id),
                        ).length;

                        return (
                          <Col
                            key={String(city.id)}
                            xs={24}
                            sm={12}
                            md={8}
                            lg={6}
                          >
                            <Card
                              size="small"
                              hoverable
                              onClick={() =>
                                navigate(
                                  `/zp9qpanel/pharmacies?cityId=${city.id}&cityName=${encodeURIComponent(String(city.name))}`,
                                )
                              }
                              style={{
                                borderRadius: 8,
                                border: "1px solid #e2e8f0",
                                cursor: "pointer",
                                transition:
                                  "box-shadow 0.2s, border-color 0.2s",
                              }}
                              styles={{ body: { padding: "12px 14px" } }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <Text
                                    strong
                                    style={{
                                      display: "block",
                                      fontSize: 13,
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    🏙 {city.name}
                                  </Text>
                                  {city.name_ar && (
                                    <Text
                                      type="secondary"
                                      style={{
                                        fontSize: 11,
                                        direction: "rtl",
                                        display: "block",
                                      }}
                                    >
                                      {city.name_ar}
                                    </Text>
                                  )}
                                  <div style={{ marginTop: 6 }}>
                                    <Tag
                                      color={
                                        cityPharmacyCount > 0
                                          ? "blue"
                                          : "default"
                                      }
                                      style={{ fontSize: 11 }}
                                    >
                                      {cityPharmacyCount} pharmacies
                                    </Tag>
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 4,
                                    marginLeft: 6,
                                  }}
                                >
                                  <Space
                                    size={2}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Tooltip title="Edit City">
                                      <Button
                                        icon={<EditOutlined />}
                                        size="small"
                                        type="text"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(
                                            `/zp9qpanel/cities/edit/${city.id}`,
                                          );
                                        }}
                                      />
                                    </Tooltip>
                                    <Tooltip title="Delete City">
                                      <Button
                                        icon={<DeleteOutlined />}
                                        size="small"
                                        type="text"
                                        danger
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCity(city.id as string);
                                        }}
                                      />
                                    </Tooltip>
                                  </Space>
                                  <Tooltip title="View Pharmacies">
                                    <Button
                                      icon={<LeftOutlined />}
                                      size="small"
                                      type="text"
                                      style={{ color: "#1976d2" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/zp9qpanel/pharmacies?cityId=${city.id}&cityName=${encodeURIComponent(String(city.name))}`,
                                        );
                                      }}
                                    />
                                  </Tooltip>
                                </div>
                              </div>
                            </Card>
                          </Col>
                        );
                      })}
                  </Row>
                )}
              </Panel>
            );
          })}
      </Collapse>
    </div>
  );
};

export const RegionCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "regions",
    action: "create",
    redirect: "list",
    successNotification: {
      message: "Region created successfully",
      type: "success",
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input dir="rtl" />
        </Form.Item>
        <Form.Item label="Name (EN)" name="name_en">
          <Input />
        </Form.Item>
        <Form.Item label="Name AR" name="name_ar">
          <Input dir="rtl" />
        </Form.Item>
        <Form.Item label="Slug" name="slug">
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};

export const RegionEdit: React.FC<IResourceComponentsProps> = () => {
  const { id } = useParams();

  const { formProps, saveButtonProps, query } = useForm({
    resource: "regions",
    action: "edit",
    id,
    redirect: "list",
    successNotification: {
      message: "Region updated successfully",
      type: "success",
    },
  });

  if (query?.isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input dir="rtl" />
        </Form.Item>
        <Form.Item label="Name (EN)" name="name_en">
          <Input />
        </Form.Item>
        <Form.Item label="Name (AR)" name="name_ar">
          <Input dir="rtl" />
        </Form.Item>
        <Form.Item label="Slug" name="slug">
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};
