import { Create, Edit, useForm } from "@refinedev/antd";
import {
  Form,
  Input,
  Collapse,
  Tag,
  Space,
  Button,
  Spin,
  Typography,
  Card,
  Row,
  Col,
  Tooltip,
  App,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { IResourceComponentsProps } from "@refinedev/core";
import { useList, useDelete } from "@refinedev/core";
import { useNavigate, useParams } from "react-router-dom";

const { Panel } = Collapse;
const { Title, Text } = Typography;

export const CityList: React.FC<IResourceComponentsProps> = () => {
  const navigate = useNavigate();
  const { mutate: deleteOne } = useDelete();
  const { modal } = App.useApp();

  const { data: citiesData, isLoading } = useList({
    resource: "cities",
    pagination: { pageSize: 1000 },
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  const cities = citiesData?.data ?? [];

  const regionMap = new Map<string, typeof cities>();
  for (const city of cities) {
    const region = city.region ?? "Unknown Region";
    if (!regionMap.has(region)) regionMap.set(region, []);
    regionMap.get(region)!.push(city);
  }

  const handleDelete = (id: string | number) => {
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
          mutationMode: "optimistic",
          successNotification: { message: "City deleted", type: "success" },
        });
      },
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Cities by Region
          </Title>
          <Text type="secondary">
            {[...regionMap.keys()].length} regions · {cities.length} cities
            total
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/zp9qpanel/cities/create")}
        >
          Add City
        </Button>
      </div>

      <Collapse
        defaultActiveKey={[...regionMap.keys()]}
        accordion={false}
        style={{
          background: "transparent",
          border: "none",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {[...regionMap.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([region, regionCities]) => (
            <Panel
              key={region}
              style={{
                borderRadius: 10,
                overflow: "hidden",
                border: "1px solid #e2e8f0",
                marginBottom: 0,
              }}
              header={
                <Space>
                  <BankOutlined style={{ color: "#1976d2" }} />
                  <Text strong style={{ fontSize: 15 }}>
                    {region}
                  </Text>
                  <Tag color="blue">{regionCities.length} cities</Tag>
                </Space>
              }
            >
              <Row gutter={[12, 12]}>
                {regionCities
                  .sort((a, b) => String(a.name).localeCompare(String(b.name)))
                  .map((city) => (
                    <Col key={String(city.id)} xs={24} sm={12} md={8} lg={6}>
                      <Card
                        size="small"
                        style={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          height: "100%",
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
                                fontSize: 14,
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
                                  fontSize: 12,
                                  direction: "rtl",
                                  display: "block",
                                }}
                              >
                                {city.name_ar}
                              </Text>
                            )}
                          </div>
                          <Space
                            size={4}
                            style={{ flexShrink: 0, marginLeft: 8 }}
                          >
                            <Tooltip title="Edit">
                              <Button
                                icon={<EditOutlined />}
                                size="small"
                                type="text"
                                onClick={() =>
                                  navigate(`/zp9qpanel/cities/edit/${city.id}`)
                                }
                              />
                            </Tooltip>
                            <Tooltip title="Delete">
                              <Button
                                icon={<DeleteOutlined />}
                                size="small"
                                type="text"
                                danger
                                onClick={() => handleDelete(city.id as string)}
                              />
                            </Tooltip>
                          </Space>
                        </div>
                      </Card>
                    </Col>
                  ))}
              </Row>
            </Panel>
          ))}
      </Collapse>
    </div>
  );
};

export const CityCreate: React.FC<IResourceComponentsProps> = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "cities",
    action: "create",
    redirect: "list",
    successNotification: {
      message: "City created successfully",
      type: "success",
    },
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Name (EN)" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Name (AR)" name="name_ar">
          <Input dir="rtl" />
        </Form.Item>
        <Form.Item label="Region" name="region">
          <Input />
        </Form.Item>
      </Form>
    </Create>
  );
};

export const CityEdit: React.FC<IResourceComponentsProps> = () => {
  const { id } = useParams();

  const { formProps, saveButtonProps, query } = useForm({
    resource: "cities",
    action: "edit",
    id,
    redirect: "list",
    successNotification: {
      message: "City updated successfully",
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
        <Form.Item label="Name (EN)" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Name (AR)" name="name_ar">
          <Input dir="rtl" />
        </Form.Item>
        <Form.Item label="Region" name="region">
          <Input />
        </Form.Item>
      </Form>
    </Edit>
  );
};
